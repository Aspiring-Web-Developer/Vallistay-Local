export const moduleLabel = (name = "") => {
  const key = String(name).toLowerCase();
  if (key === "customer" || key === "customers") return "Guests";
  return name.charAt(0).toUpperCase() + name.slice(1);
};