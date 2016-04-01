# -*- coding: utf-8 -*-

from sklearn import datasets
import urllib2
import json
iris = datasets.load_iris()

headers = {
    'Content-Type': 'application/json',
    'passwd': '123456'
}
url = 'http://202.120.40.73:28080/Entity/U7f2d2f8faaa9/test/Cart/?userid=233837063867287'


dataset = [ 
    [ '豆奶', '莴苣' , '', ''], 
    [ '莴苣', '尿布', '葡萄酒', '甜菜' ], 
    [ '莴苣', '尿布', '葡萄酒', '橙汁' ], 
    [ '莴苣', '豆奶', '尿布', '葡萄酒' ], 
    [ '莴苣', '豆奶', '尿布', '橙汁' ] 
]

#r = []
for row in dataset:
    elem = {
        "col0": row[0],
        "col1": row[1],
        "col2": row[2],
        "col3": row[3]
    }
    #r.append(elem)
    postStr = json.dumps(elem)
    req = urllib2.Request(url, postStr, headers)
    res = urllib2.urlopen(req)
    print res.read().decode('utf-8')
#postStr = json.dumps(r)

"""
req = urllib2.Request(url, postStr, headers)
res = urllib2.urlopen(req)
print res.read().decode('utf-8')
"""