export function getDeviceId(): string {
  let id = localStorage.getItem("our_fit_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("our_fit_device_id", id);
  }
  return id;
}
