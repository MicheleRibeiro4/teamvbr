
import { ProtocolData } from '../types';

const STORAGE_KEY = 'vbr_cloud_data';

export const db = {
  // Simula uma chamada de API para o banco de dados
  async getAll(): Promise<ProtocolData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = localStorage.getItem(STORAGE_KEY);
        resolve(data ? JSON.parse(data) : []);
      }, 500); // Simula latência de rede
    });
  },

  async save(protocols: ProtocolData[]): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
        resolve();
      }, 800);
    });
  },

  // Funções de Backup Manual
  exportBackup(protocols: ProtocolData[]) {
    const dataStr = JSON.stringify(protocols, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `vbr_backup_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  },

  async importBackup(file: File): Promise<ProtocolData[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed)) {
            resolve(parsed);
          } else {
            reject('Formato de backup inválido');
          }
        } catch (err) {
          reject('Erro ao ler arquivo de backup');
        }
      };
      reader.readAsText(file);
    });
  }
};
