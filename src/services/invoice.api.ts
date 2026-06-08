import api from '../api/axios';

export const downloadInvoice = async (orderId: string): Promise<{ blob: Blob; invoiceNumber: string }> => {
  // 1. Fetch the invoice linked to this order to get the invoice ID
  const invoiceRes = await api.get(`/api/invoices/order/${orderId}`);
  const invoiceId = invoiceRes.data.data.id;

  // 2. Request a signed download URL for the PDF
  const dlRes = await api.get(`/api/invoices/${invoiceId}/download`);
  const { download_url, invoice_number } = dlRes.data.data;

  // 3. Fetch the actual PDF blob from the signed URL
  const pdfRes = await fetch(download_url);
  if (!pdfRes.ok) {
    throw new Error('Failed to fetch the PDF file.');
  }
  const blob = await pdfRes.blob();

  return { blob, invoiceNumber: invoice_number };
};
