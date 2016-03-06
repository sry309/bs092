# -*- coding: utf-8 -*-

from flask import request
import re
import json
import MySQLdb
import config
from sklearn.cluster import KMeans

json.encode = json.dumps
json.decode = json.loads

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
def mining():
    
    #获取参数
    target = request.form['target']
    if not re.match(r'^\w+$', target):
        return 'Target invalid!';
    cols = request.form.get('cols')
    if cols and not re.match(r'^\d+(,\d+)*$', cols):
        return 'Cols invalid!'
    algo = request.form['algo']
    writeBack = request.form['writeBack']
    if not re.match(r'^\w+$', writeBack):
        return 'WriteBack invalid!';
    args = request.form.get('args')
    if args:
        args = json.decode(args);
    context = {
        "target": target,
        "cols": cols,
        "writeBack": writeBack,
        "args": args
    }
    
    # 调用具体算法
    if algo == "kmeans":
        return kmeans(context)
    else:
        return "invalid algo."

def kmeans(context):
    conn = MySQLdb.connect(host=config.db["host"], \
                           user=config.db["username"], \
                           passwd=config.db["password"], \
                           port=config.db["port"], \
                           db=config.db["name"])
    cursor = conn.cursor()
    
    sql = "select * from " + context["target"]
    cursor.execute(sql)
    result = list(cursor.fetchall())
    for i in range(len(result)):
        result[i] = list(result[i])[1:] # remove id
        
    clf = KMeans()
    clf.fit(result)
    param = []
    for i in range(len(clf.labels_)):
        param.append([i, clf.labels_[i]])
    sql = "insert ignore into " + context["writeBack"] + " values (%s,%s)"
    cursor.executemany(sql, param) 
    
    conn.commit()
    cursor.close()
    conn.close()
    return 'Done...'