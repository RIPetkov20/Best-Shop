export async function loadComponent(elementId, filePath) {
    const container = document.getElementById(elementId);
    if (!container)
        return;
    const res = await fetch(filePath);
    const html = await res.text();
    container.innerHTML = html;
}
