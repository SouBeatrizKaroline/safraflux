export async function api(path, body) {
  const response = await fetch("/api/" + path, {
    method: body ? "POST" : "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: body
      ? { "Content-Type": "application/json", "X-SafraFlux-Request": "1" }
      : {},
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(
      "O servidor não respondeu corretamente. Nenhuma confirmação de gravação foi recebida.",
    );
  }
  if (!response.ok) {
    const error = new Error(result.error || "Não foi possível concluir.");
    error.status = response.status;
    throw error;
  }
  return result;
}
