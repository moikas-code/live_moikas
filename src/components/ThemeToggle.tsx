'use client';

export default function ThemeToggle() {
  return (
    <select
      className="select select-bordered select-sm"
      aria-label="Theme toggle"
      onChange={(e) => {
        document.documentElement.setAttribute('data-theme', e.target.value);
      }}
      defaultValue="light"
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="cupcake">Cupcake</option>
      <option value="bumblebee">Bumblebee</option>
      <option value="emerald">Emerald</option>
      <option value="corporate">Corporate</option>
      <option value="synthwave">Synthwave</option>
      <option value="dracula">Dracula</option>
      <option value="night">Night</option>
      <option value="coffee">Coffee</option>
      <option value="winter">Winter</option>
    </select>
  );
} 