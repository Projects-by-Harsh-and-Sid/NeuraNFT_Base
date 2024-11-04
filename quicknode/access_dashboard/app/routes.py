# app/routes.py
from flask import render_template, current_app as app

user_wallet_address = '0xYourUserWalletAddress'  # Replace with actual address

# Sample data (replace with your actual data source)
data = [
    {
        'nftid': 1,
        'collectionid': 101,
        'user_address': '0xA1B2C3D4E5F678901234567890ABCDEF12345678',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'AbsoluteOwnership (6)',
        'current_level': 'UseModel (1)',
        'status': 'Failed',
        'reason': 'Access is prohibited',
        'timestamp': '2023-11-03 10:00:00'
    },
    {
        'nftid': 2,
        'collectionid': 102,
        'user_address': '0xB2C3D4E5F678901234567890ABCDEF1234567890',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'UseModel (1)',
        'current_level': 'AbsoluteOwnership (6)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:05:00'
    },
    {
        'nftid': 3,
        'collectionid': 103,
        'user_address': '0xC3D4E5F678901234567890ABCDEF1234567890AB',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'EditData (5)',
        'current_level': 'EditData (5)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:10:00'
    },
    {
        'nftid': 4,
        'collectionid': 104,
        'user_address': '0xD4E5F678901234567890ABCDEF1234567890ABCD',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'ViewAndDownload (4)',
        'current_level': 'Resale (2)',
        'status': 'Failed',
        'reason': 'Access is prohibited',
        'timestamp': '2023-11-03 10:15:00'
    },
    {
        'nftid': 5,
        'collectionid': 105,
        'user_address': '0xE5F678901234567890ABCDEF1234567890ABCDE1',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'Resale (2)',
        'current_level': 'Resale (2)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:20:00'
    },
    {
        'nftid': 6,
        'collectionid': 106,
        'user_address': '0xF678901234567890ABCDEF1234567890ABCDE123',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'CreateReplica (3)',
        'current_level': 'ViewAndDownload (4)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:25:00'
    },
    {
        'nftid': 7,
        'collectionid': 107,
        'user_address': '0x678901234567890ABCDEF1234567890ABCDE1234',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'UseModel (1)',
        'current_level': 'UseModel (1)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:30:00'
    },
    {
        'nftid': 8,
        'collectionid': 108,
        'user_address': '0x78901234567890ABCDEF1234567890ABCDE12345',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'EditData (5)',
        'current_level': 'CreateReplica (3)',
        'status': 'Failed',
        'reason': 'Access is prohibited',
        'timestamp': '2023-11-03 10:35:00'
    },
    {
        'nftid': 9,
        'collectionid': 109,
        'user_address': '0x8901234567890ABCDEF1234567890ABCDE123456',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'CreateReplica (3)',
        'current_level': 'CreateReplica (3)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:40:00'
    },
    {
        'nftid': 10,
        'collectionid': 110,
        'user_address': '0x901234567890ABCDEF1234567890ABCDE1234567',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'ViewAndDownload (4)',
        'current_level': 'AbsoluteOwnership (6)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:45:00'
    },
    {
        'nftid': 11,
        'collectionid': 111,
        'user_address': '0x01234567890ABCDEF1234567890ABCDE12345678',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'Resale (2)',
        'current_level': 'UseModel (1)',
        'status': 'Failed',
        'reason': 'Access is prohibited',
        'timestamp': '2023-11-03 10:50:00'
    },
    {
        'nftid': 12,
        'collectionid': 112,
        'user_address': '0x1234567890ABCDEF1234567890ABCDE123456789',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'AbsoluteOwnership (6)',
        'current_level': 'AbsoluteOwnership (6)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 10:55:00'
    },
    {
        'nftid': 13,
        'collectionid': 113,
        'user_address': '0x234567890ABCDEF1234567890ABCDE123456789',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'UseModel (1)',
        'current_level': 'Resale (2)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 11:00:00'
    },
    {
        'nftid': 14,
        'collectionid': 114,
        'user_address': '0x34567890ABCDEF1234567890ABCDE12345678901',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'CreateReplica (3)',
        'current_level': 'EditData (5)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 11:05:00'
    },
    {
        'nftid': 15,
        'collectionid': 115,
        'user_address': '0x4567890ABCDEF1234567890ABCDE123456789012',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'EditData (5)',
        'current_level': 'ViewAndDownload (4)',
        'status': 'Failed',
        'reason': 'Access is prohibited',
        'timestamp': '2023-11-03 11:10:00'
    },
    {
        'nftid': 16,
        'collectionid': 116,
        'user_address': '0x567890ABCDEF1234567890ABCDE1234567890123',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'ViewAndDownload (4)',
        'current_level': 'ViewAndDownload (4)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 11:15:00'
    },
    {
        'nftid': 17,
        'collectionid': 117,
        'user_address': '0x67890ABCDEF1234567890ABCDE1234567890123',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'Resale (2)',
        'current_level': 'CreateReplica (3)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 11:20:00'
    },
    {
        'nftid': 18,
        'collectionid': 118,
        'user_address': '0x7890ABCDEF1234567890ABCDE1234567890123',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'AbsoluteOwnership (6)',
        'current_level': 'EditData (5)',
        'status': 'Failed',
        'reason': 'Access is prohibited',
        'timestamp': '2023-11-03 11:25:00'
    },
    {
        'nftid': 19,
        'collectionid': 119,
        'user_address': '0x890ABCDEF1234567890ABCDE12345678901234',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'EditData (5)',
        'current_level': 'AbsoluteOwnership (6)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 11:30:00'
    },
    {
        'nftid': 20,
        'collectionid': 120,
        'user_address': '0x90ABCDEF1234567890ABCDE123456789012345',
        'owner_address': '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
        'operation': 'Get Access Request',
        'access_request': 'UseModel (1)',
        'current_level': 'UseModel (1)',
        'status': 'Success',
        'reason': 'Access provided',
        'timestamp': '2023-11-03 11:35:00'
    }
]

# app/routes.py
from flask import render_template, current_app as app

user_wallet_address = '0xYourUserWalletAddress'  # Replace with actual address

# ... (existing code)

@app.route('/')
def dashboard():
    return render_template('dashboard.html', user_wallet_address=user_wallet_address)

@app.route('/table')
def table():
    return render_template('table.html', data=data, user_wallet_address=user_wallet_address)
