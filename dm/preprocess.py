# -*- coding: utf-8 -*-
import math

def removeAbsence(data):
    return [row for row in data if None not in row]

def fillAbsenceWithVal(data, val):
    result = []
    for row in data:
        result.append([x if x is not None else val for x in row])
    return result

def fillAbsenceWithAvg(data):
    result = data[:]
    wid = len(result[0])
    hei = len(result)
    avg = [0] * wid
    num = [0] * wid
    for row in result:
        for i in xrange(wid):
            elem = row[i];
            if elem is not None:
                avg[i] += elem
                num[i] += 1
    for i in xrange(wid):
        if(num[i] != 0):
            avg[i] /= num[i]
    for row in result:
        for i in xrange(wid):
            if row[i] is None:
                row[i] = avg[i]
    return result

def maxMinRestrict(data):
    result = data[:]
    wid = len(result[0])
    hei = len(result)
    maxList = [-1] * wid
    minList = [float('inf')] * wid
    for row in result:
        for i in xrange(wid):
            elem = row[i]
            if elem is None: continue
            if abs(row[i]) > maxList[i]:
                maxList[i] = abs(row[i])
            if abs(row[i]) < minList[i]:
                minList[i] = abs(row[i])
    for row in result:
        for i in xrange(wid):
            elem = row[i]
            if elem is None: continue
            row[i] = (elem - minList[i]) / (maxList[i] - minList[i])
    return result
            
def zScoreRestrict(data):
    result = data[:]
    wid = len(result[0])
    hei = len(result)
    avg = [0] * wid
    avgpow2 = [0] * wid
    num = [0] * wid
    for row in result:
        for i in xrange(wid):
            elem = row[i];
            if elem is not None:
                avg[i] += elem
                avgpow2[i] += elem ** 2
                num[i] += 1
    for i in xrange(wid):
        if(num[i] != 0):
            avg[i] /= num[i]
            avgpow2[i] /= num[i]
    sigma = [(avgpow2[i] - avg[i] ** 2) ** 0.5 for i in xrange(wid)]
    for row in result:
        for i in xrange(wid):
            elem = row[i]
            if elem is None: continue
            row[i] = (elem - avg[i]) / sigma[i]
    return result

def getBit(num):
    num = abs(num)
    if(num < 1): return 0
    else: return math.floor(math.log10(num)) + 1

def demicalRestrict(data):
    result = data[:]
    wid = len(result[0])
    hei = len(result)
    bits = [0] * wid
    for row in result:
        for i in xrange(wid):
            elem = row[i]
            if elem is None: continue
            bit = getBit(elem)
            if bit > bits[i]:
                bits[i] = bit
    for row in result:
        for i in xrange(wid):
            elem = row[i]
            if elem is None: continue
            row[i] = elem / 10 ** bits[i]
    return result