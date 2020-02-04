import styled, { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  #app {
    width: 100%;
    height: 100%;
  }

  .ani-no-drag {
    -webkit-app-region: no-drag;
  }

  .noselect {
    user-select: none; /* Non-prefixed version, currently
                          supported by Chrome, Opera and Firefox */
  }
`;

export const AppContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  left: 0px;
  top: 0px;

  .ani-main-content {
    flex-grow: 1;

    display: flex;
    flex-direction: column;
  }
`;

export const CentralArea = styled.div`
  flex-grow: 1;

  display: flex;
  flex-direction: column;
`;

export const MainContentContainer = styled.div`
  flex-grow: 1;

  display: flex;
  align-items: center;
  justify-content: center;
`;
