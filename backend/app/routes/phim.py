from flask import Blueprint, jsonify
from app.models.db import get_connection

phim_bp = Blueprint('phim', __name__)

@phim_bp.route('/phim', methods=['GET'])
def get_phim():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM Phim")
    data = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(data)
