import { RenderConfigurationProperty } from "../Config";
import { FunctionComponent } from "react";

export type PropertyEditorProps<TProperty extends RenderConfigurationProperty = RenderConfigurationProperty> = {
  propertyKey: string;
  property: TProperty;
  initial?: any;
  onUpdated: (key: string, oldValue: any, newValue: any) => void;
};

export type PropertyEditorComponent<TProperty extends RenderConfigurationProperty> = FunctionComponent<
  PropertyEditorProps<TProperty>
>;
