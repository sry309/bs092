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
    else:
        cols = []
    assert isinstance(cols, list)
    
    # rows=[start, count]
    rows = request.form.get('rows')
    if rows:
        rows = json.parse(rows)
    else:
        rows = []
    assert isinstance(rows, list)
    
    
    algo = request.form.get('algo')
    
    args = request.form.get('args')
    if args:
        args = json.parse(args);
    else:
        args = {}
    assert isinstance(args, dict)
    
    context = {
        "user": user,
        "proj": proj,
        "rsrc": rsrc,
        "cols": cols,
        "rows": rows,
        "args": args
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

def getData(context):
    url = config.rmp + '/Entity/' + \
          context['user'] + '/' + \
          context['proj'] + '/' + \
          context['rsrc'] + '/'
    jsonStr = urllib2.urlopen(urllib2.Request(url)).read().decode('utf-8')
    data = json.parse(jsonStr)[context['rsrc']]
    
    cols = context["cols"]
    idList = []
    dataList = []
    for elem in data:
        idList.append(elem['id'])
        del elem['id']
        row = []
        for k, v in elem.items():
            if (v != None and v != "") and \
               (len(cols) == 0 or k in cols):
                row.append(v)
        dataList.append(row)
    
    rows = context["rows"]
    if len(rows) == 0:
        rows = [0, None]
    elif len(rows) == 1:
        rows *= 2
        rows[0] = 0
    else:
        rows[1] += rows[0]
    
    return idList[rows[0]:rows[1]], dataList[rows[0]:rows[1]]


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