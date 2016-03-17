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

json.stringify = json.dumps
json.parse = json.loads

def index():
    return 'Hello, Flask!'

"""
    参数：
        target：目标数据表的名称，格式为\w+
        cols：表中的列序号，格式为\d+(,\d+)*
        algo：所使用的算法
        writeBack：写回的数据库，格式为\w+
        args：参数，格式为json
"""
def mining(user, proj, rsrc):
    
    #获取参数
    for e in [user, proj, rsrc]:
        if not re.match(r'^\w+$', e):
            return json.stringify({'succ': False, 'msg': 'Target invalid!'})
    cols = request.form.get('cols')
    if cols and not re.match(r'^\d+(,\d+)*$', cols):
        return json.stringify({'succ': False, 'msg': 'Cols invalid!'})
    algo = request.form.get('algo')
    args = request.form.get('args')
    if args:
        args = json.parse(args);
    context = {
        "user": user,
        "proj": proj,
        "rsrc": rsrc,
        "cols": cols,
        "args": args
    }
    
    # 调用具体算法
    if algo == "kmeans":
        return kmeans(context)
    elif algo == "kmedoids":
        return kmedoids(context)
    else:
        return json.stringify({'succ': False, 'msg': 'Unknown algo!'})

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

def getData(context):
    url = config.rmp + '/Entity/' + \
          context['user'] + '/' + \
          context['proj'] + '/' + \
          context['rsrc'] + '/'
    jsonStr = urllib2.urlopen(urllib2.Request(url)).read().decode('utf-8')
    data = json.parse(jsonStr)[context['rsrc']]
    
    idList = []
    dataList = []
    for elem in data:
        idList.append(elem['id'])
        del elem['id']
        row = []
        for k, v in elem.items():
            row.append(v)
        dataList.append(row)
    
    return idList, dataList


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