import { RenderConfigurationProperty, PropertyInfer } from "../Config";
import { FunctionComponent } from "react";

export type PropertyEditorProps<TProperty extends RenderConfigurationProperty = RenderConfigurationProperty> = {
  propertyKey: string;
  property: TProperty;
  initial?: PropertyInfer<TProperty>;
  onUpdated: (key: string, oldValue: any, newValue: any) => void;
};

export type PropertyEditorComponent<TProperty extends RenderConfigurationProperty> = FunctionComponent<
  PropertyEditorProps<TProperty>
>;
