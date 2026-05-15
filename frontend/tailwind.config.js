export default {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(5px)" },
          to:   { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.2s ease",
      },
    },
  },
};