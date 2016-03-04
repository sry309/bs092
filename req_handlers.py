from flask import request
import re
import json

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
    if cols and not re.match(r'^\d+(,\d+)*$', cols)
        return 'Cols invalid!'
    algo = request.form['algo']
    writeBack = request.form['writeBack']
    if not re.match(r'^\w+$', writeBack):
        return 'WriteBack invalid!';
    args = request.form.get('args')
    if args:
        args = json.decode(args);