from flask import Flask,request,jsonify
from flask_cors import CORS
import mysql.connector as sql

app = Flask(__name__)
CORS(app)

#------------Data Base Connection------------


def sqlConector() :
    return sql.connect(
        host='localhost',
        user='root',
        password='',
        database='feedbacks'
    )
    
    
#-----------Get users------------
@app.route("/users")
def users():
    conn = sqlConector()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM feedbacks")
    resault = cursor.fetchall()
    
    users_list = []
    
    for row in resault:
        users_list.append({
            "upvoteCount" : row[0],
            "badgeLetter" : row[1],
            "company" : row[2],
            "text" : row[3],
            "createdAt" : row[4]
        })
        
    conn.close()
    cursor.close()
        
    return jsonify({"feedbacks": users_list})
    
    
#-----------ADD USER-------------
@app.route("/add", methods = ["POST"])
def addUser():
    data = request.get_json() or {}
    
    upvoteCount = data["upvoteCount"]
    badgeLetter = data["badgeLetter"]
    company = data["company"]
    text = data["text"]
    createdAt = data["createdAt"]
    
    conn = sqlConector()
    cursor = conn.cursor()
    
    cursor.execute(
        """
        INSERT INTO feedbacks (upvoteCount,badgeLetter,company,text,createdAt)
        values (%s ,%s ,%s ,%s ,%s)
        """,
        (upvoteCount , badgeLetter, company, text, createdAt)
    )
    
    conn.commit()
    
    cursor.close()
    conn.close()
    
    return jsonify({"message": "added"})

# ---------------- RUN SERVER ----------------
if __name__ == "__main__":
    app.run(debug=True)