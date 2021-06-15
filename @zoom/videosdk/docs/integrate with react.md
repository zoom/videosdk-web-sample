# Integrate with React App

We recommend you to use `Context` to hold the `ZoomClient` instance.

- Firstly we create a react context.
```javascript
// ZoomClientContext.js
import React from 'react';
export default React.createContext(null);
```

- In the app entry file(index.js), add Context Provider.
```javascript
// index.js
import React from 'react';
import ReactDOM from 'react-dom';
import ZoomContext from './ZoomClientContext';
import ZoomVideo from '@zoom/videosdk';
const client = ZoomVideo.createClient();
ReactDOM.render(
   <ZoomContext.Provider value={client}>
    <App />
  </ZoomContext.Provider>,
  document.getElementById('root')
)
```

- You can access to the `client` object's properties via the withZoom higher-order component.
```javascript
// withZoom.js
import React from "react";
import hoistStatics from "hoist-non-react-statics";
import ZoomContext from './ZoomClientContext';
function withZoom(Component){
  const displayName = `withZoom(${Component.displayName || Component.name})`;
  const C = props => {
    const { wrappedComponentRef, ...remainingProps } = props;
    return (
      <ZoomContext.Consumer>
        {context => {
          return (
            <Component
              {...remainingProps}
              client={context}
              ref={wrappedComponentRef}
            />
          );
        }}
      </ZoomContext.Consumer>
    );
  };
  C.displayName = displayName;
  C.WrappedComponent = Component;
  return hoistStatics(C, Component);
}
export default withZoom;
```

- Use `ZoomContext`.
```javascript
import React from "react";
import ZoomContext from './ZoomClientContext';
const CustomComponent = (props)=>{
  const client = useContext(ZoomContext);
  
}
export default CustomComponent;
```

- Use `withZoom `
```javascript
import React from "react";
import withZoom from './withZoom';
const CustomComponent = (props)=>{
  const client = props.client;
};
export const default withZoom(CustomComponent);
```