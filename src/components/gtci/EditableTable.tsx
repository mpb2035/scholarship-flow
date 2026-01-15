import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface Column {
  key: string;
  header: string;
  width?: string;
  type?: 'text' | 'textarea' | 'number';
}

interface EditableTableProps<T extends Record<string, unknown>> {
  columns: Column[];
  data: T[];
  onDataChange: (data: T[]) => void;
  editable?: boolean;
  onAddRow?: () => void;
  newRowTemplate?: T;
  title?: string;
}

export function EditableTable<T extends Record<string, unknown>>({
  columns,
  data,
  onDataChange,
  editable = true,
  newRowTemplate,
  title
}: EditableTableProps<T>) {
  const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCellChange = (rowIndex: number, key: string, value: string | number) => {
    const newData = [...data];
    newData[rowIndex] = { ...newData[rowIndex], [key]: value };
    onDataChange(newData);
  };

  const handleAddRow = () => {
    if (newRowTemplate) {
      onDataChange([...data, { ...newRowTemplate }]);
    }
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    onDataChange(newData);
  };

  const copyTableToClipboard = () => {
    const headers = columns.map(col => col.header).join('\t');
    const rows = data.map(row => 
      columns.map(col => String(row[col.key] ?? '')).join('\t')
    ).join('\n');
    
    const tableText = `${headers}\n${rows}`;
    navigator.clipboard.writeText(tableText).then(() => {
      setCopied(true);
      toast.success('Table copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const renderCell = (row: T, column: Column, rowIndex: number) => {
    const value = row[column.key];
    const isEditing = editingCell?.row === rowIndex && editingCell?.col === column.key;

    if (!editable) {
      return <span className="text-sm">{String(value ?? '')}</span>;
    }

    if (isEditing) {
      if (column.type === 'textarea') {
        return (
          <Textarea
            value={String(value ?? '')}
            onChange={(e) => handleCellChange(rowIndex, column.key, e.target.value)}
            onBlur={() => setEditingCell(null)}
            className="min-h-[60px] text-sm"
            autoFocus
          />
        );
      }
      return (
        <Input
          type={column.type === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(e) => handleCellChange(rowIndex, column.key, 
            column.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
          )}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => e.key === 'Enter' && setEditingCell(null)}
          className="h-8 text-sm"
          autoFocus
        />
      );
    }

    return (
      <div
        className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[24px] text-sm"
        onClick={() => setEditingCell({ row: rowIndex, col: column.key })}
      >
        {String(value ?? '')}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        {title && <h4 className="font-medium text-sm">{title}</h4>}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyTableToClipboard}
            className="flex items-center gap-1"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? 'Copied!' : 'Copy Table'}
          </Button>
          {editable && newRowTemplate && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddRow}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Add Row
            </Button>
          )}
        </div>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead 
                  key={column.key} 
                  style={{ width: column.width }}
                  className="font-semibold text-xs"
                >
                  {column.header}
                </TableHead>
              ))}
              {editable && <TableHead className="w-16">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="hover:bg-muted/30">
                {columns.map((column) => (
                  <TableCell key={column.key} className="py-2">
                    {renderCell(row, column, rowIndex)}
                  </TableCell>
                ))}
                {editable && (
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
