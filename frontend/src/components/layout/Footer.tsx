const Footer = () => {
  return (
    <footer
      className="
        border-t
        border-gray-200
        dark:border-gray-800
        py-8
        px-6
        bg-white
        dark:bg-[var(--griffin-dark)]
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          flex
          flex-col
          md:flex-row
          justify-between
          items-center
          gap-4
        "
      >
        <div
          className="
            text-lg
            font-bold
            text-[var(--griffin-gold)]
          "
        >
          Griffin Academy
        </div>

        <p
          className="
            text-sm
            text-gray-600
            dark:text-gray-400
          "
        >
          © {new Date().getFullYear()} Griffin Academy. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
