# -*- coding: utf-8 -*-

from flask import request, make_response

import sys
reload(sys)
sys.setdefaultencoding('utf-8')

import json
json.stringify = json.dumps
json.parse = json.loads

def iris(token, proj):
    from sklearn import datasets
    iris = datasets.load_iris()
    r = []
    for i in xrange(len(iris.data)):
        row = iris.data[i]
        elem = {
            "id": i,
            "col0": int(row[0] * 10) / 10.0,
            "col1": int(row[1] * 10) / 10.0,
            "col2": int(row[2] * 10) / 10.0,
            "col3": int(row[3] * 10) / 10.0,
            "label": iris.target[i]
        }
        r.append(elem)
    return json.stringify({'Iris': r})

def cart(token, proj):
    from dm import loadCart
    cart = loadCart()
    r = []
    id = 0
    for row in cart:
        elem = {
            "id": id,
            "col0": row[0],
            "col1": row[1],
            "col2": row[2],
            "col3": row[3]
        }
        r.append(elem)
        id += 1
    return make_response(json.stringify({"Cart": r}))

def getProj():
    return """
        <projects>
            <project>
                <name>U7f2d2f8faaa9/proj</name>
                <time>Tue May 17 2016 10:46:43</time>
                <privilege>4</privilege>
            </project>
        </projects>
    """
    
def getRsrcList():
    return """
        <resources>
            <resource>
                <name>Iris</name>
                <lastmodified>Tue May 17 2016 10:46:43</lastmodified>
                <state>OK</state>
            </resource>
            <resource>
                <name>Cart</name>
                <lastmodified>Tue May 17 2016 10:46:43</lastmodified>
                <state>OK</state>
            </resource>
        </resources>
    """
    
def getRsrc():
    rsrc = request.args.get('resource')
    if rsrc == 'Iris':
        return """
            <Columns>
                <Column>
                    <ColumnName>col0</ColumnName>
                    <AttributeName></AttributeName>
                    <Size></Size>
                    <isNotNull></isNotNull>
                    <type>Number</type>
                </Column>
                <Column>
                    <ColumnName>col1</ColumnName>
                    <AttributeName></AttributeName>
                    <Size></Size>
                    <isNotNull></isNotNull>
                    <type>Number</type>
                </Column>
                <Column>
                    <ColumnName>col2</ColumnName>
                    <AttributeName></AttributeName>
                    <Size></Size>
                    <isNotNull></isNotNull>
                    <type>Number</type>
                </Column>
                <Column>
                    <ColumnName>col3</ColumnName>
                    <AttributeName></AttributeName>
                    <Size></Size>
                    <isNotNull></isNotNull>
                    <type>Number</type>
                </Column>
                <Column>
                    <ColumnName>label</ColumnName>
                    <AttributeName></AttributeName>
                    <Size></Size>
                    <isNotNull></isNotNull>
                    <type>Number</type>
                </Column>
            </Columns>
        """
    elif rsrc == 'Cart':
        return """
            <Columns>
                <Column>
                    <ColumnName>col0</ColumnName>
                    <AttributeName></AttributeName>
                    <Size>50</Size>
                    <isNotNull></isNotNull>
                    <type>String</type>
                </Column>
                <Column>
                    <ColumnName>col1</ColumnName>
                    <AttributeName></AttributeName>
                    <Size>50</Size>
                    <isNotNull></isNotNull>
                    <type>String</type>
                </Column>
                <Column>
                    <ColumnName>col2</ColumnName>
                    <AttributeName></AttributeName>
                    <Size>50</Size>
                    <isNotNull></isNotNull>
                    <type>String</type>
                </Column>
                <Column>
                    <ColumnName>col3</ColumnName>
                    <AttributeName></AttributeName>
                    <Size>50</Size>
                    <isNotNull></isNotNull>
                    <type>String</type>
                </Column>
            </Columns>
        """
    else:
        return """
            <Columns>
                <error>Column not found!</error>
            </Columns>
        """

def login():
    return json.stringify({"error": None, "id": 233837063867287})