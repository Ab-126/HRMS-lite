import client from "./client";

export const getAttendance = (params) =>
  client.get("/attendance/", { params }).then((r) => r.data);
export const getEmployeeAttendance = (id, params) =>
  client.get(`/attendance/employee/${id}`, { params }).then((r) => r.data);
export const markAttendance = (data) =>
  client.post("/attendance/", data).then((r) => r.data);
export const deleteAttendance = (id) =>
  client.delete(`/attendance/${id}`).then((r) => r.data);