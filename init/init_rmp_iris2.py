from sklearn import datasets
import urllib2
import json
iris = datasets.load_iris()

headers = {
    'Content-Type': 'application/json',
    'passwd': '123456'
}
url = 'http://202.120.40.73:28080/Entity/U7f2d2f8faaa9/test/Iris2/?userid=233837063867287'


#r = []
i = 0
for row in iris.data:
    elem = {
        "col0": int(row[0] * 10) / 10.0,
        "col1": int(row[1] * 10) / 10.0,
        "col2": int(row[2] * 10) / 10.0,
        "col3": int(row[3] * 10) / 10.0,
        "label": iris.target[i]
    }
    #r.append(elem)
    postStr = json.dumps(elem)
    req = urllib2.Request(url, postStr, headers)
    res = urllib2.urlopen(req)
    print res.read().decode('utf-8')
    i += 1
#postStr = json.dumps(r)

"""
req = urllib2.Request(url, postStr, headers)
res = urllib2.urlopen(req)
print res.read().decode('utf-8')
"""