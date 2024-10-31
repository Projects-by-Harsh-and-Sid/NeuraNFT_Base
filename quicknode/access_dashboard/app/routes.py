# app/routes.py
from flask import render_template, current_app as app
import json


with open('D:/Projects/03 Hackathon/Base_Hackathon/quicknode/access_dashboard/app/data.json', 'r') as file:
    data = json.load(file)
    
    

user_wallet_address = '0x43ADAc5516f8E2D3d2BD31276BeC343547ee6612'  # Replace with actual address

# Format the wallet address to show only the first and last 5 characters
formatted_wallet_address = f"{user_wallet_address[:5]}...{user_wallet_address[-5:]}"

# ... (existing code)

@app.route('/')
def dashboard():
    return render_template('dashboard.html', user_wallet_address=formatted_wallet_address)

@app.route('/table')
def table():
    return render_template('table.html', data=data, user_wallet_address=formatted_wallet_address)
