import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class InterviewService {
    async generatePrep(data) {
        try {
            const response = await axios.post(`${API_BASE}/interview/prepare`, data);
            return response.data;
        } catch (error) {
            console.error('Generate prep error:', error);
            throw error;
        }
    }

    async createReminder(data) {
        try {
            const response = await axios.post(`${API_BASE}/interview/reminder`, data);
            return response.data;
        } catch (error) {
            console.error('Create reminder error:', error);
            throw error;
        }
    }

    async createApplicationReminder(data) {
        try {
            const response = await axios.post(`${API_BASE}/interview/application-reminder`, data);
            return response.data;
        } catch (error) {
            console.error('Create application reminder error:', error);
            throw error;
        }
    }
}

export const interviewService = new InterviewService();