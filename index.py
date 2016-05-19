# -*- coding: utf-8 -*-

from flask import Flask, send_from_directory, redirect
import req_handlers
import rmp_simulator
import config
import os

app = Flask(__name__)
app.debug = True

app.add_url_rule('/System/User/', view_func=rmp_simulator.login)
app.add_url_rule('/System/Project/', view_func=rmp_simulator.getProj)
app.add_url_rule('/System/Resource/', view_func=rmp_simulator.getRsrc)
app.add_url_rule('/System/Resource/list/', view_func=rmp_simulator.getRsrcList)
app.add_url_rule('/Entity/<token>/<proj>/Iris/', view_func=rmp_simulator.iris)
app.add_url_rule('/Entity/<token>/<proj>/Cart/', view_func=rmp_simulator.cart)

app.add_url_rule('/mining/<int:uid>/<token>/<proj>/<rsrc>/', view_func=req_handlers.mining, methods=['POST'])
app.add_url_rule('/history/<int:uid>/', view_func=req_handlers.getHistory)
app.add_url_rule('/history/<int:uid>/<int:id>/', view_func=req_handlers.getHistoryById)
app.add_url_rule('/result/<int:id>/', view_func=req_handlers.getResultById)
app.add_url_rule('/result/<int:id>/csv/', view_func=req_handlers.getResultCsv)
app.add_url_rule('/message/<int:uid>/', view_func=req_handlers.getMessageUnread)
app.add_url_rule('/message/<int:uid>/all/', view_func=req_handlers.getMessageAll)
app.add_url_rule('/message/<int:uid>/mark/<int:id>/', view_func=req_handlers.markMessage)
app.add_url_rule('/message/<int:uid>/mark/all/', view_func=req_handlers.markMessageAll)
app.add_url_rule('/notify/<int:uid>/', view_func=req_handlers.notify)

@app.route('/<path:path>')
def staticHtml(path):
    return send_from_directory(config.staticPath, path)

@app.route('/js/<path:path>')
def staticJs(path):
    return send_from_directory(os.path.join(config.staticPath, 'js'), path)

@app.route('/css/<path:path>')
def staticCss(path):
    return send_from_directory(os.path.join(config.staticPath, 'css'), path)

@app.route('/img/<path:path>')
def staticImg(path):
    return send_from_directory(os.path.join(config.staticPath, 'img'), path)

@app.route('/')
def redirIndex():
    return redirect('/index.html')

if __name__ == '__main__':
    app.run(threaded=True)