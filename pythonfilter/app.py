from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from filter_jobs import filter_jobs
from resume_analyzer import analyze_resume

app = Flask(__name__)

@app.route('/filter', methods=['POST'])
def filter_jobs_endpoint():
    try:
        data = request.json
        jobs = data.get('jobs', [])
        preferences = data.get('preferences', {})
        
        filtered_jobs = filter_jobs(jobs, preferences)
        return jsonify(filtered_jobs)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analyze-resume', methods=['POST'])
def analyze_resume_endpoint():
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No resume file provided'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        result = analyze_resume(file)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)