from sklearn import datasets
from sklearn.cluster import KMeans, MiniBatchKMeans
import MySQLdb
iris = datasets.load_iris()
#digits = datasets.load_digits()
#print type(iris.data), iris.data.shape
#print iris.target

"""
conn = MySQLdb.connect(host='127.0.0.1',user='root',passwd='123456',db="test")
cur = conn.cursor()

for i in range(len(iris.data)):
    elem = iris.data[i];
    sql = "insert into iris values (%s, %s, %s, %s, %s)"
    cur.execute(sql, (i, elem[0], elem[1], elem[2], elem[3]))

conn.commit()
cur.close()
conn.close()
"""

clf = KMeans(n_clusters=9)
clf.fit(iris.data)
print clf,"\n", clf.labels_,"\n", clf.cluster_centers_

"""
clf = MiniBatchKMeans(n_clusters=9)
clf.fit(iris.data)
print clf,"\n", clf.labels_,"\n", clf.cluster_centers_
"""