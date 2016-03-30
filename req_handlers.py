# -*- coding: utf-8 -*-

from flask import request
import re
import json
import config
from sklearn.cluster import KMeans
from sklearn import datasets
import urllib2
import time
import dm
import sys

reload(sys)
sys.setdefaultencoding('utf-8')

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
    
    #获取参数
    for e in [user, proj, rsrc]:
        if not re.match(r'^\w+$', e):
            return json.stringify({'succ': False, 'msg': 'Target invalid!'})
    
    # cols=["col0","col1","col2", ...]
    cols = request.form.get('cols')
    if cols:
        cols = json.parse(cols)
        assert isinstance(cols, list)
    else:
        cols = []
    
    # rows=[start, count]
    rows = request.form.get('rows')
    if rows:
        rows = json.parse(rows)
        assert isinstance(rows, list)
    else:
        rows = []
    rows = handleRowsArr(rows)
    
    # predict=[start, count]
    predict = request.form.get('predict')
    if predict:
        predict = json.parse(predict)
        assert isinstance(predict, list)
    else:
        predict = []
    predict = handleRowsArr(predict)
    
    algo = request.form.get('algo')
    label = request.form.get('label')
    
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
        "rows": rows,
        "args": args,
        "label" : label,
        "predict": predict
    }
    
    # 调用具体算法
    if algo == "kmeans":
        return kmeans(context)
    elif algo == "kmedoids":
        return kmedoids(context)
    elif algo == "apriori":
        return apriori(context)
    else:
        return json.stringify({'succ': False, 'msg': 'Unknown algo!'})

def apriori(context):
    idList, dataList = getData(context)
    
    oriRes = dm.apriori(dataList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'assoc')
    result = []
    count = 0
    for row in oriRes:
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
    
    _, _, oriRes = dm.kmedoids(dataList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'cluster')
    result = []
    clusterId = 0
    for medoid in oriRes.keys():
        for i in oriRes[medoid]:
            result.append((id, idList[i], clusterId))
        clusterId += 1
    
    dbWriteBack(cursor, result)
    
    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def kmeans(context):
    idList, dataList = getData(context)
        
    clf = KMeans()
    clf.fit(dataList)
    
    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'cluster')
    result = []
    for i in range(len(clf.labels_)):
        result.append((id, idList[i], clf.labels_[i]))
    
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
        idList.append(elem['id'])
        del elem['id']
        
        if(label):
            labelList.append(elem[label])
            del elem[label]
        
        row = []
        for k, v in elem.items():
            if (v != None and v != "") and \
               (len(cols) == 0 or k in cols):
                row.append(v)
        dataList.append(row)
    
    return idList[start:end], \
        dataList[start:end], labelList[start:end]

def handleRowsArr(rows):
    if len(rows) == 0:
        rows =  [0, None]
    elif len(rows) == 1:
        rows *= 2
        rows[0] = 0
    else:
        rows[1] += rows[0]
    return rows

def getData(context):
    rawData = getDataFromSvr(context['user'], \
        context['proj'], context['rsrc'])
        
    cols = context['cols']
    rows = context['rows']
    idList, dataList, _ = convertData(rawData, rows[0], rows[1], cols)
    
    return idList, dataList

def getDataWithLabel(context):
    rawData = getDataFromSvr(context['user'], \
        context['proj'], context['rsrc'])
    
    cols = context['cols']
    rows = context['rows']
    predict = context['predict']
    label = context['label']
    
    # 训练集
    _, dataList, labelList = convertData(rawData, rows[0], rows[1], cols, label)
    
    # 测试集
    idList, pridictList, _ = convertData(rawData, predict[0], predict[1], cols)
    
    return dataList, labelList, idList, pridictList

def iris(user):
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