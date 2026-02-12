// Initialize the home screen and render the default UI state.
const init = () => {
  if (topUserPic) topUserPic.style.display = 'none';
  renderAccountPic();
  render();
  renderMessages();
};

init();