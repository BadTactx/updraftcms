import * as React from "react";
import { Card, TextArea, TextAreaProps } from 'semantic-ui-react';


import { IPropertyMap, IDocumentProperty } from 'models';

interface ILongTextComponentProps {
  documentProperty: IDocumentProperty
  propertyMap: IPropertyMap;
  onPropertyUpdate: (documentProperty: IDocumentProperty) => void;
}
interface ILongTextComponentState {
  expanded: boolean;
}

class LongTextComponent extends React.Component<
  ILongTextComponentProps,
  ILongTextComponentState
  > {
  public state = {
    expanded: false
  };

  public handleExpandClick = () => {
    this.setState(state => ({ expanded: !state.expanded }));
  };

  public changeValue = (e: any, { value }: TextAreaProps) => {
    const { documentProperty, onPropertyUpdate } = this.props;
    onPropertyUpdate({ ...documentProperty, value });
  };

  public render() {
    const { propertyMap, documentProperty } = this.props;
    return (
      <Card fluid={true}>
        <Card.Content>
          <Card.Header onClick={this.handleExpandClick}>
            {propertyMap.name}
          </Card.Header>
        </Card.Content>
        <Card.Content>
          <TextArea
          required={propertyMap.required}
            name="value" rows={5}
            onChange={this.changeValue}
            value={documentProperty.value}
            placeholder="Enter value"
          />
        </Card.Content>
      </Card>
    );
  }
}
export default LongTextComponent;
