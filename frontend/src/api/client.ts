import axios from 'axios';
import { Diagram, ValidationResult } from '../types';

const api = axios.create({ baseURL: 'http://localhost:3001' });

export const createDiagram = (name: string) =>
  api.post('/diagrams', { name }).then(r => r.data);

export const getDiagram = (id: string): Promise<Diagram> =>
  api.get(`/diagrams/${id}`).then(r => r.data);

export const listDiagrams = () =>
  api.get('/diagrams').then(r => r.data);

export const saveDiagram = (id: string, data: Partial<Diagram>) =>
  api.put(`/diagrams/${id}`, data).then(r => r.data);

export const validateDiagram = (id: string): Promise<ValidationResult> =>
  api.post(`/diagrams/${id}/validate`).then(r => r.data);

export const generatePseudocode = (id: string): Promise<{ pseudocode: string }> =>
  api.post(`/diagrams/${id}/generate`).then(r => r.data);

export const exportDiagram = async (id: string, format: string) => {
  const response = await api.post(`/diagrams/${id}/export`, { format }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `diagram.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const deleteDiagram = (id: string) =>
  api.delete(`/diagrams/${id}`).then(r => r.data);

export const renameDiagram = (id: string, name: string) =>
  api.patch(`/diagrams/${id}`, { name }).then(r => r.data);