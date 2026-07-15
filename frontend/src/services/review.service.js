import api from "./api";

export const uploadSingleFile = async ({
  file,
  projectId,
  onUploadProgress,
}) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("projectId", projectId);

  const { data } = await api.post("/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
    timeout: 300000,
  });

  return data;
};

export const uploadZipProject = async ({
  file,
  projectId,
  onUploadProgress,
}) => {
  const formData = new FormData();

  formData.append("project", file);
  formData.append("projectId", projectId);

  const { data } = await api.post(
    "/upload/project",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
      timeout: 600000,
    }
  );

  return data;
};

export const reviewGithubRepository = async ({
  projectId,
  repositoryUrl,
}) => {
  const { data } = await api.post("/github/review", {
    projectId: Number(projectId),
    repositoryUrl,
  });

  return data;
};

export const getReviews = async () => {
  const { data } = await api.get("/project-scans");

  return data;
};

export const getReview = async (id) => {
  const { data } = await api.get(
    `/project-scans/${id}`
  );

  return data;
};

export const deleteReview = async (id) => {
  const { data } = await api.delete(
    `/project-scans/${id}`
  );

  return data;
};

export const downloadReviewPdf = async (id) => {
  const response = await api.get(
    `/pdf/project-scan/${id}`,
    {
      responseType: "blob",
    }
  );

  const contentDisposition =
    response.headers["content-disposition"];

  const fileNameMatch =
    contentDisposition?.match(
      /filename="?([^";]+)"?/i
    );

  const fileName =
    fileNameMatch?.[1] ||
    `project-scan-${id}-report.pdf`;

  const pdfBlob = new Blob([response.data], {
    type: "application/pdf",
  });

  const pdfUrl =
    window.URL.createObjectURL(pdfBlob);

  const downloadLink =
    document.createElement("a");

  downloadLink.href = pdfUrl;
  downloadLink.download = fileName;

  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();

  window.URL.revokeObjectURL(pdfUrl);
};