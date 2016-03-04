from sklearn import datasets
from sklearn.cluster import KMeans, MiniBatchKMeans
iris = datasets.load_iris()
#digits = datasets.load_digits()
#print type(iris.data), iris.data.shape
#print iris.target

clf = KMeans(n_clusters=9)
clf.fit(iris.data)
print clf,"\n", clf.labels_,"\n", clf.cluster_centers_

clf = MiniBatchKMeans(n_clusters=9)
clf.fit(iris.data)
print clf,"\n", clf.labels_,"\n", clf.cluster_centers_