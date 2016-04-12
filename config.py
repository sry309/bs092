import MySQLdb
import os

db = {
    'host': '127.0.0.1',
    'username': 'root',
    'password': '123456',
    'port': 3306,
    'name': 'test'
}

rmp = 'http://202.120.40.73:28080'

staticPath = 'page'

def getConn():
    return MySQLdb.connect(host=db["host"], \
                           user=db["username"], \
                           passwd=db["password"], \
                           port=db["port"], \
                           db=db["name"], \
                           charset="utf8")