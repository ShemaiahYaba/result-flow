import { useState, useEffect } from 'react';
import { authService } from '@/services/authService';

export interface MarksheetColumn {
  id: string;
  column_name: string;
  type: 'identifier' | 'text' | 'score';
  required: boolean;
  created_at: string;
}

export interface MarksheetColumnInput {
  column_name: string;
  type: 'identifier' | 'text' | 'score';
  required: boolean;
}

export function useMarksheetFormat() {
  const [columns, setColumns] = useState<MarksheetColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchColumns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.authenticatedFetch('/api/admin/marksheet-format');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to fetch marksheet format');
      }

      const data = result.data || result;
      setColumns(data);
    } catch (error: any) {
      console.error('Failed to fetch marksheet format:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createColumn = async (input: MarksheetColumnInput) => {
    try {
      const response = await authService.authenticatedFetch('/api/admin/marksheet-format', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to create marksheet column');
      }

      const newColumn = result.data || result;
      setColumns(prev => [...prev, newColumn]);
      return newColumn;
    } catch (error: any) {
      console.error('Failed to create marksheet column:', error);
      throw error;
    }
  };

  const updateColumn = async (id: string, input: Partial<MarksheetColumnInput>) => {
    try {
      const response = await authService.authenticatedFetch('/api/admin/marksheet-format', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, ...input }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to update marksheet column');
      }

      const updatedColumn = result.data || result;
      setColumns(prev => 
        prev.map(c => c.id === id ? updatedColumn : c)
      );
      return updatedColumn;
    } catch (error: any) {
      console.error('Failed to update marksheet column:', error);
      throw error;
    }
  };

  const deleteColumn = async (id: string) => {
    try {
      const response = await authService.authenticatedFetch('/api/admin/marksheet-format', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error?.message || 'Failed to delete marksheet column');
      }

      setColumns(prev => prev.filter(c => c.id !== id));
    } catch (error: any) {
      console.error('Failed to delete marksheet column:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchColumns();
  }, []);

  return {
    columns,
    loading,
    error,
    createColumn,
    updateColumn,
    deleteColumn,
    refetchColumns: fetchColumns
  };
}
