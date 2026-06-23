import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 120000
});

function getErrorMessage(error) {
  return (
    error?.response?.data?.error ||
    error?.message ||
    "Unable to complete the request. Please try again."
  );
}

export async function uploadPdf(pdfFile) {
  const formData = new FormData();
  formData.append("pdf", pdfFile);

  try {
    const { data } = await api.post("/pdf", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function submitQuestion({ sessionId, questionText, imageFile }) {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  if (questionText) formData.append("questionText", questionText);
  if (imageFile) formData.append("image", imageFile);

  try {
    const { data } = await api.post("/question", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export async function evaluateAnswer({ sessionId, answerText, imageFile }) {
  const formData = new FormData();
  formData.append("sessionId", sessionId);
  if (answerText) formData.append("answerText", answerText);
  if (imageFile) formData.append("image", imageFile);

  try {
    const { data } = await api.post("/evaluate", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}
