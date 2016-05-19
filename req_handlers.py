# -*- coding: utf-8 -*-

from flask import request, make_response
import re
import config
import urllib2
import time
from threading import Thread
import dm

import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import json
json.stringify = json.dumps
json.parse = json.loads

def index():
    return 'Hello, Flask!'

def isAssoc(algo):
    return algo in ['apriori']

def isClassify(algo):
    return algo in ['naive_bayes', 'knn', 'svm']
    
def isCluster(algo):
    return algo in ['kmeans', 'kmedoids']

"""
    参数：
        cols：列名称的列表
        rows：记录的偏移（可选）及数量
        algo：所使用的算法
        args：算法所需的参数，格式为json
"""
def mining(uid, token, proj, rsrc):

    res = make_response()
    res.headers['Content-Type'] = "application/json"

    #获取参数
    for e in [token, proj, rsrc]:
        if not re.match(r'^\w+$', e):
            res.data = json.stringify({'succ': False, 'msg': 'Rsrc invalid!'})
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

    algo = request.form.get('algo')

    args = request.form.get('args')
    if args:
        args = json.parse(args)
        assert isinstance(args, dict)
    else:
        args = {}

    context = {
        "user": uid,
        "rsrc": token + '/' + proj + '/' + rsrc,
        "cols": cols,
        "start": start,
        "end": end,
        "algo": algo,
        "args": args,
    }

    if isClassify(algo):
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
        
        label = request.form.get('label')
        if label is None: label = ""
        if not re.match(r'^\w+$', label):
            return json.stringify({'succ': False, 'msg': 'Label invalid!'})
        
        context['predictStart'] = predictStart
        context['predictEnd'] = predictEnd
        context['label'] = label
        
    if not isAssoc(algo):
        absence = request.form.get('absence')
        fillval = request.form.get('fillval')
        if fillval is None: fillval = 0
        formal = request.form.get('formal')
        distinct = request.form.get('distinct') == 'true'
        
        context['absence'] = absence
        context['fillval'] = fillval
        context['formal'] = formal
        context['distinct'] = distinct
        
    
    
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

    Thread(target=func, args=(context,)).start();
    
    res.data = json.stringify({'succ': True, 'msg': 'Done...'})
    return res

def preprocess(data, context):

    absence = context['absence']
    if absence == 'rm':
        data = dm.removeAbsence(data)
    elif absence == 'val':
        data = dm.fillAbsenceWithVal(data, context['fillval'])
    elif absence == 'avg':
        data = dm.fillAbsenceWithAvg(data)
    
    formal = context['formal']
    if formal == 'maxmin':
        data = dm.maxMinRestrict(data)
    elif formal == 'zscore':
        data = dm.zScoreRestrict(data)
    elif formal == 'demical':
        data = dm.demicalRestrict(data)

    return data

def apriori(context):
    rawData = getDataFromSvr(context['rsrc'])
    _, data = processData(rawData, context['start'], \
        context['end'], context['cols'])
    dataList = convertDataToArr(data)

    rawRes = dm.apriori(dataList)

    conn = config.getConn()
    cursor = conn.cursor()
    hid = dbAddHistory(cursor, context, 'assoc')
    result = []
    count = 0
    for row in rawRes:
        v = "{0} -> {1}".format(
            ', '.join(row[0]),
            ', '.join(row[1])
        )
        result.append((hid, count, row[2], v))
        count += 1
    dbWriteBack(cursor, result)
    dbAddMessage(cursor, context, hid)

    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def kmedoids(context):
    rawData = getDataFromSvr(context['rsrc'])
    if(context['distinct']):
        rawData = dm.distinct(rawData)
    idList, data = processData(rawData, context['start'], \
        context['end'], context['cols'])
    dataList = convertDataToArr(data)
    dataList = preprocess(dataList, context)

    _, _, rawRes = dm.kmedoids(dataList)

    conn = config.getConn()
    cursor = conn.cursor()
    hid = dbAddHistory(cursor, context, 'cluster')
    result = []
    clusterId = 0
    for medoid in rawRes.keys():
        for i in rawRes[medoid]:
            result.append((hid, idList[i], clusterId,
                json.stringify(dataList[i])))
        clusterId += 1

    dbWriteBack(cursor, result)
    dbAddMessage(cursor, context, hid)

    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def kmeans(context):
    rawData = getDataFromSvr(context['rsrc'])
    if(context['distinct']):
        rawData = dm.distinct(rawData)
    idList, data = processData(rawData, context['start'], \
        context['end'], context['cols'])
    dataList = convertDataToArr(data)
    dataList = preprocess(dataList, context)

    from sklearn.cluster import KMeans
    clf = KMeans()
    clf.fit(dataList)

    conn = config.getConn()
    cursor = conn.cursor()
    hid = dbAddHistory(cursor, context, 'cluster')
    result = []
    for i in xrange(len(clf.labels_)):
        result.append((hid, idList[i], clf.labels_[i], 
            json.stringify(data[i])))

    dbWriteBack(cursor, result)
    dbAddMessage(cursor, context, hid)

    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def classify(context):

    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.naive_bayes import MultinomialNB
    from sklearn.svm import SVC

    label = context['label']
    algo = context['algo']
    if algo == 'svm':
        classifier = SVC
    elif algo == 'knn':
        classifier = KNeighborsClassifier
    elif algo == 'naive_bayes':
        classifier = MultinomialNB
    else:
        assert False

    rawData = getDataFromSvr(context['rsrc'])
    if(context['distinct']):
        rawData = dm.distinct(rawData)
    labelList, train = getTrainingSet(rawData, label, context['start'], \
        context['end'], context['cols'])
    trainList = convertDataToArr(train)
    trainList = preprocess(trainList, context)
    idList, predict = getPredictSet(rawData, context['predictStart'], \
        context['predictEnd'], context['cols'])
    predictList = convertDataToArr(predict)
    predictList = preprocess(predictList, context)

    clf = classifier()
    clf.fit(trainList, labelList)
    rawRes = clf.predict(predictList)

    conn = config.getConn()
    cursor = conn.cursor()
    id = dbAddHistory(cursor, context, 'classify')

    result = []
    for i in xrange(len(rawRes)):
        result.append((id, idList[i], rawRes[i], json.stringify(predict[i])))

    dbWriteBack(cursor, result)
    dbAddMessage(cursor, context, id)

    conn.commit()
    cursor.close()
    conn.close()
    return json.stringify({'succ': True, 'msg': 'Done...'})

def dbAddMessage(cursor, context, hid):
    content = "您提交的任务已完成，资源：{0}，ID：{1}。".format(context['rsrc'], hid);
    sql = 'insert into message (userid, content, tm) values (%s, %s, null)'
    cursor.execute(sql, (context['user'], content))

def dbAddHistory(cursor, context, type):
    sql = 'insert into history (userid, rsrc, tp, tm) values (%s, %s, %s, null)'
    cursor.execute(sql, (context['user'], context['rsrc'], type))
    return cursor.lastrowid

def dbWriteBack(cursor, result):
    sql = "insert into result values (%s,%s,%s,%s)"
    cursor.executemany(sql, result)

def getDataFromSvr(rsrc):
    url = config.rmp + '/Entity/' + rsrc + '/'
    jsonStr = urllib2.urlopen(urllib2.Request(url)).read().decode('utf-8')
    return json.parse(jsonStr)[rsrc.split('/')[-1]]

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

def processData(rawData, start = 0, end = None, cols = []):
    data = rawData[start:end]
    
    idList = []
    for i in xrange(len(data)):
        elem = dict(data[i])
        idList.append(elem['id'])
        del elem['id']
        for k, v in elem.items():
            if len(cols) != 0 and k not in cols:
                del elem[k]
        data[i] = elem
    return idList, data

getPredictSet = processData

def getTrainingSet(rawData, label, start = 0, end = None, cols = []):
    data = rawData[start:end]
    labelList = []
    for i in xrange(len(data)):
        elem = dict(data[i])
        del elem['id']
        labelList.append(elem[label])
        for k, v in elem.items():
            if len(cols) != 0 and k not in cols:
                del elem[k]
        data[i] = elem
    return labelList, data

def convertDataToArr(data):
    dataList = []
    for elem in data:
        row = []
        for v in elem.values():
            row.append(v)
        dataList.append(row)
    return dataList

def getData(context):
    rawData = getDataFromSvr(context['rsrc'])

    cols = context['cols']
    start = context['start']
    end = context['end']
    idList, dataList, _ = convertData(rawData, start, end, cols)

    return idList, dataList

def getDataWithLabel(context):
    rawData = getDataFromSvr(context['rsrc'])

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

def getHistory(uid):
    return getHistoryById(uid, 0)

# id=0时为全部
def dbGetHistory(cur, uid, id):
    sql = "select id,rsrc,tp,tm from history where 1=1"
    args = []
    if id != 0:
        sql += ' and id=%s'
        args.append(id)
    if uid != 0:
        sql += ' and userid=%s'
        args.append(uid)
    cur.execute(sql, tuple(args))
    result = []
    for row in cur.fetchall():
        tm = row[3]
        if tm is not None:
            tm = str(tm)
        obj = {
            "id": row[0],
            "rsrc": row[1],
            "type": row[2],
            "time": tm
        }
        result.append(obj)
    return result

# id=0时为全部
def getHistoryById(uid, id):
    conn = config.getConn()
    cur = conn.cursor()
    result = dbGetHistory(cur, uid, id)
    cur.close()
    conn.close()
    res = make_response(json.stringify({"succ": True, "data": result}))
    res.headers["Content-Type"] = "application/json"
    return res

def dbGetResult(cur, id):
    sql = "select id,res1,res2 from result where hid=%s"
    cur.execute(sql, (id,))
    result = cur.fetchall()
    return result

def getResultById(id):
    conn = config.getConn()
    cur = conn.cursor()
    result = dbGetResult(cur, id)
    cur.close()
    conn.close()
    res = make_response(json.stringify({"succ": True, "data": result}))
    return res

def csvForm(s):
    s = str(s)
    if ',' in s:
        s = '"' + s + '"'
    return s

def generateCsvAssoc(data):
    from cStringIO import StringIO
    buffer = StringIO()
    headLine = ['id', 'rule', 'conf']
    buffer.write(','.join(headLine))
    buffer.write('\n')
    
    for row in data:
        line = map(csvForm, [row[0], row[2], row[1]])
        buffer.write(','.join(line))
        buffer.write('\n')
        
    return buffer.getvalue()

def generateCsvOther(data): 
    data = [list(row) for row in data]
    for row in data:
        row[2] = json.parse(row[2])
    attrs = data[0][2].keys()
    
    from cStringIO import StringIO
    buffer = StringIO()
    
    headLine = []
    headLine.append('id')
    for k in attrs: headLine.append(k)
    headLine.append('label')
    buffer.write(','.join(headLine))
    buffer.write('\n')
    
    for row in data:
        line = []
        line.append(str(row[0]))
        for k in attrs: line.append(str(row[2][k]))
        line.append(str(row[1]))
        line = map(csvForm, line)
        buffer.write(','.join(line))
        buffer.write('\n')
    
    return buffer.getvalue()

def getResultCsv(id):
    conn = config.getConn()
    cur = conn.cursor()
    history = dbGetHistory(cur, 0, id)
    data = dbGetResult(cur, id)
    cur.close()
    conn.close()
    
    if len(history) == 0:
        assert False
    history = history[0]
    
    if history['type'] == 'assoc':
        result = generateCsvAssoc(data)
    else:
        result = generateCsvOther(data)
    res = make_response(result)
    res.headers["Content-Type"] = "application/csv;charset=utf-8"
    res.headers["Content-Disposition"] = "attachment; filename=" + str(id) + ".csv"
    return res

# isread=-1时为全部
def getMessage(uid, isread):
    conn = config.getConn()
    cur = conn.cursor()
    sql = "select id,content,tm,isread from message where userid=%s"
    if isread == 1:
        sql += " and isread=1"
    elif isread == 0:
        sql += " and isread=0"
    sql += " order by id desc"
    cur.execute(sql, (uid,))
    result = cur.fetchall()
    cur.close()
    conn.close()
    newResult = []
    for row in result:
        obj = {
            "id": row[0],
            "content": row[1],
            "tm": str(row[2]),
            "isread": 1 if row[3] else 0
        }
        newResult.append(obj)
    return make_response(json.stringify({"succ": True, "data": newResult}))

def getMessageUnread(uid):
    return getMessage(uid, 0)

def getMessageAll(uid):
    return getMessage(uid, -1)

# id=0 为全部
def markMessage(uid, id):
    conn = config.getConn()
    cur = conn.cursor()
    sql = "update message set isread=1 where userid=%s"
    if id != 0:
        sql += " and id=" + str(id)
    cur.execute(sql, (uid,))
    conn.commit()
    cur.close()
    conn.close()
    return make_response(json.stringify({"succ": True}))

def markMessageAll(uid):
    return markMessage(uid, 0)

def notify(uid):
    conn = config.getConn()
    cur = conn.cursor()
    sql = "select count(*) from message where userid=%s and isread=0"
    cur.execute(sql, (uid,))
    num = cur.fetchall()[0][0]
    cur.close()
    conn.close()
    return make_response(json.stringify({"succ": True, "unread": num}))

