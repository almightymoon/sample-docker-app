from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

app = Flask(__name__)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///tasks.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Task Model
class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, in_progress, completed
    priority = db.Column(db.String(10), default='medium')  # low, medium, high
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/api')
def api_info():
    return jsonify({
        'message': 'Task Management API',
        'version': '1.0',
        'endpoints': {
            'GET /api/tasks': 'Get all tasks',
            'GET /api/tasks/<id>': 'Get a specific task',
            'POST /api/tasks': 'Create a new task',
            'PUT /api/tasks/<id>': 'Update a task',
            'DELETE /api/tasks/<id>': 'Delete a task',
            'GET /api/health': 'Health check'
        }
    })

@app.route('/api/health')
def health():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    status_filter = request.args.get('status')
    priority_filter = request.args.get('priority')
    
    query = Task.query
    
    if status_filter:
        query = query.filter_by(status=status_filter)
    if priority_filter:
        query = query.filter_by(priority=priority_filter)
    
    tasks = query.all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())

@app.route('/api/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    valid_statuses = ['pending', 'in_progress', 'completed']
    valid_priorities = ['low', 'medium', 'high']
    
    status = data.get('status', 'pending')
    priority = data.get('priority', 'medium')
    
    if status not in valid_statuses:
        return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
    
    if priority not in valid_priorities:
        return jsonify({'error': f'Invalid priority. Must be one of: {valid_priorities}'}), 400
    
    task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=status,
        priority=priority
    )
    
    db.session.add(task)
    db.session.commit()
    
    return jsonify(task.to_dict()), 201

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    valid_statuses = ['pending', 'in_progress', 'completed']
    valid_priorities = ['low', 'medium', 'high']
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        if data['status'] not in valid_statuses:
            return jsonify({'error': f'Invalid status. Must be one of: {valid_statuses}'}), 400
        task.status = data['status']
    if 'priority' in data:
        if data['priority'] not in valid_priorities:
            return jsonify({'error': f'Invalid priority. Must be one of: {valid_priorities}'}), 400
        task.priority = data['priority']
    
    task.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify(task.to_dict())

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'message': f'Task {task_id} deleted successfully'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=os.environ.get('FLASK_ENV') == 'development')

