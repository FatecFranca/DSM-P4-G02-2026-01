type ViewProps = import('react-native/Libraries/Components/View/ViewPropTypes').ViewProps;
type TextProps = import('react-native/Libraries/Text/TextProps').TextProps;

declare module 'react-native/Libraries/Components/View/View' {
  export class View extends React.Component<ViewProps> {}
}

declare module 'react-native/Libraries/Text/Text' {
  export class Text extends React.Component<TextProps> {}
}
