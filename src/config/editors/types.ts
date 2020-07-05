import { RenderConfigurationProperty, PropertyInfer } from "../Config";
import { FunctionComponent } from "react";

export type PropertyEditorProps<TProperty extends RenderConfigurationProperty = RenderConfigurationProperty> = {
  propertyKey: string;
  property: TProperty;
  initial?: PropertyInfer<TProperty>;
  onUpdated: (key: string, oldValue: PropertyInfer<TProperty> | undefined, newValue: PropertyInfer<TProperty>) => void;
};

export type PropertyEditorComponent<TProperty extends RenderConfigurationProperty> = FunctionComponent<
  PropertyEditorProps<TProperty>
>;
