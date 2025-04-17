import { write } from 'xlsx';

self.onmessage = async (event) => {
  try {
    const { rows } = event.data;
    
    // Convert rows to worksheet
    const worksheet = rows.map(row => {
      const obj: Record<string, any> = {};
      row.forEach((cell: any, index: number) => {
        obj[String.fromCharCode(65 + index)] = cell;
      });
      return obj;
    });

    // Create workbook and add worksheet
    const workbook = {
      Sheets: { 'Sheet1': worksheet },
      SheetNames: ['Sheet1']
    };

    // Generate XLSX file
    const arrayBuffer = write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Send the buffer back to the main thread
    self.postMessage({ buffer: arrayBuffer }, [arrayBuffer]);
  } catch (error) {
    self.postMessage({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
  }
}; 