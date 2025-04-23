from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/alarm', methods=['POST'])
def handle_alarm():
    data = request.json
    print("\n🔔 ALARM DITERIMA 🔔")
    print(data)
    return jsonify({"message": "Alarm received by BMS"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050)
