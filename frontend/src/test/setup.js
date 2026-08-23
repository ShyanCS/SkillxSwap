import '@testing-library/jest-dom/vitest';

// jsdom lacks the scrolling APIs some pages call after data loads.
Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || (() => {});
window.scrollTo = window.scrollTo || (() => {});
