# -*- coding: utf-8 -*-

from flask import request, make_response
import re
import config
import urllib2
import time

import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import json
json.stringify = json.dumps
json.parse = json.loads

def index():
    return 'Hello, Flask!'

"""
    参数：
        cols：列名称的列表
        rows：记录的偏移（可选）及数量
        algo：所使用的算法
        args：算法所需的参数，格式为json
"""
def mining(user, proj, rsrc):
    
    res = make_response()
    res.headers['Content-Type'] = "application/json"
    
    #获取参数
    for e in [user, proj, rsrc]:
        if not re.match(r'^\w+$', e):
            res.data = json.stringify({'succ': False, 'msg': 'Target invalid!'})
            return res
    
    # cols=["col0","col1","col2", ...]
    cols = request.form.get('cols')
    if cols:
        cols = json.parse(cols)
        assert isinstance(cols, list)
    else:
        cols = []
    
    # start
    start = request.form.get('start')
    if start:
        start = int(start)
    else:
        start = 0
        
    # count
    count = request.form.get('count')
    if count:
        count = int(count)
        end = start + count
    else:
        end = None
    
    # predictStart
    predictStart = request.form.get('predictStart')
    if predictStart:
        predictStart = int(predictStart)
    else:
        predictStart = 0
        
    # predictCount
    predictCount = request.form.get('predictCount')
    if predictCount:
        predictCount = int(predictCount)
        predictEnd = predictStart + predictCount
    else:
        predictEnd = None
    
    algo = request.form.get('algo')
    label = request.form.get('label')
    if label == None: label = ""
    
    args = request.form.get('args')
    if args:
        args = json.parse(args)
        assert isinstance(args, dict)
    else:
        args = {}
    
    context = {
        "user": user,
        "proj": proj,
        "rsrc": rsrc,
        "cols": cols,
        "start": start,
        "end": end,
        "algo": algo,
        "args": args,
        "label" : label,
        "predictStart": predictStart,
        "predictEnd": predictEnd
    }
    
    # 调用具体算法
    funcDict = {
        "kmeans": kmeans,
        "kmedoids": kmedoids,
        "apriori": apriori,
        "naive_bayes": classify,
        "knn": classify,
        "svm": classify
    }
    func = funcDict.get(algo)
    if not func:
        res.data = json.stringify({'succ': False, 'msg': 'Unknown algo!'})
        return res
    
    res.data = func(context)
    return res

def apriori(context):
    idList, dataList = getData(context)
    
    from dm import apriori
    rawRes = apriori(dataList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'assoc')
    result = []
    count = 0
    for row in rawRes:
        v = "{0} -> {1} : {2}".format(
            ', '.join(row[0]),
            ', '.join(row[1]),
            row[2]
        )
        result.append((id, count, v))
        count += 1
    dbWriteBack(cursor, result)
    
    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def kmedoids(context):
    idList, dataList = getData(context)
    
    from dm import kmedoids
    _, _, rawRes = kmedoids(dataList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'cluster')
    result = []
    clusterId = 0
    for medoid in rawRes.keys():
        for i in rawRes[medoid]:
            result.append((id, idList[i], clusterId))
        clusterId += 1
    
    dbWriteBack(cursor, result)
    
    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def kmeans(context):
    idList, dataList = getData(context)
    
    from sklearn.cluster import KMeans
    clf = KMeans()
    clf.fit(dataList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'cluster')
    result = []
    for i in xrange(len(clf.labels_)):
        result.append((id, idList[i], clf.labels_[i]))
    
    dbWriteBack(cursor, result)
    
    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def classify(context):

    if not re.match(r'^\w+$', label):
        return json.stringify({'succ': False, 'msg': 'Label invalid!'})

    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.naive_bayes import MultinomialNB 
    from sklearn.svm import SVC 
    
    algo = context['algo']
    if algo == 'svm':
        classifier = SVC
    elif algo == 'knn':
        classifier = KNeighborsClassifier
    elif algo == 'naive_bayes':
        classifier = MultinomialNB
    else:
        assert False
    
    dataList, labelList, idList, predictList \
        = getDataWithLabel(context)
    
    clf = classifier()
    clf.fit(dataList, labelList)
    rawRes = clf.predict(predictList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'classify')
    
    result = []
    for i in xrange(len(rawRes)):
        result.append((id, idList[i], rawRes[i]))
    
    dbWriteBack(cursor, result)
    
    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})


def dbAddHistory(cursor, context, type):
    sql = 'insert into history (userid, proj, rsrc, tp, tm) values (%s, %s, %s, %s, %s)'
    ts = int(time.time())
    cursor.execute(sql, (context['user'], context['proj'], context['rsrc'], 
                         type, ts))
    return cursor.lastrowid

def dbWriteBack(cursor, result):
    sql = "insert into result values (%s,%s,%s)"
    cursor.executemany(sql, result) 

def getDataFromSvr(user, proj, rsrc):
    url = config.rmp + '/Entity/' + \
          user + '/' + \
          proj + '/' + \
          rsrc + '/'
    jsonStr = urllib2.urlopen(urllib2.Request(url)).read().decode('utf-8')
    return json.parse(jsonStr)[rsrc]

def convertData(data, start = 0, end = None, cols = [], label = None):
    """
    将对象数组转化为二维数组，
    将id单独拿出来存为数组，
    如有标签将其去除，
    最后将数组切片。
    """
    
    idList = []
    dataList = []
    labelList = []
    for elem in data:
        elemId = elem['id']
        idList.append(elemId)
        del elem['id']
        
        if(label):
            elemLabel = elem[label]
            labelList.append(elemLabel)
            del elem[label]
        
        row = []
        for k, v in elem.items():
            if (v != None and v != "") and \
               (len(cols) == 0 or k in cols):
                row.append(v)
        dataList.append(row)
        
        elem['id'] = elemId
        if(label): elem[label] = elemLabel
    
    return idList[start:end], \
        dataList[start:end], labelList[start:end]

def getData(context):
    rawData = getDataFromSvr(context['user'], \
        context['proj'], context['rsrc'])
        
    cols = context['cols']
    start = context['start']
    end = context['end']
    idList, dataList, _ = convertData(rawData, start, end, cols)
    
    return idList, dataList

def getDataWithLabel(context):
    rawData = getDataFromSvr(context['user'], \
        context['proj'], context['rsrc'])
    
    cols = context['cols']
    start = context['start']
    end = context['end']
    predictStart = context['predictStart']
    predictEnd = context['predictEnd']
    label = context['label']
    
    # 训练集
    _, dataList, labelList = convertData(rawData, start, end, cols, label)
    
    # 测试集
    idList, predictList, _ = convertData(rawData, predictStart, predictEnd, cols, label)
    
    return dataList, labelList, idList, predictList



def iris(user):
    from sklearn import datasets
    iris = datasets.load_iris()
    r = []
    id = 1
    for row in iris.data:
        elem = {
            "id": id,
            "col0": int(row[0] * 10) / 10.0,
            "col1": int(row[1] * 10) / 10.0,
            "col2": int(row[2] * 10) / 10.0,
            "col3": int(row[3] * 10) / 10.0
        }
        r.append(elem)
        id += 1
    return json.stringify({'iris': r})

def getResult():
    conn = config.getConn()
    cur = conn.cursor()
    sql = "select id,userid,proj,rsrc,tp,tm from history"
    cur.execute(sql)
    result = []
    for row in cur.fetchall():
        obj = {
            "id": row[0],
            "uid": row[1],
            "proj": row[2],
            "rsrc": row[3],
            "type": row[4],
            "time": row[5]
        }
        result.append(obj)
    cur.close()
    conn.close()
    
    res = make_response(json.stringify(result))
    res.headers["Content-Type"] = "application/json"
    return res
    