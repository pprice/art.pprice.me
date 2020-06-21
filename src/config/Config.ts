type BaseProp<T> = {
  displayName?: string;
  default?: T;
};

export type NumericProperty = BaseProp<number> & {
  type: "number";
  min?: number;
  max?: number;
  step?: number;
};

export type NumericRangeProperty = BaseProp<[number, number]> & {
  type: "number-range";
  min: number;
  max: number;
  step?: number;
};

export type BooleanProperty = BaseProp<boolean> & {
  type: "boolean";
};

export type StringProperty = BaseProp<string> & {
  type: "string";
};

export type ImageSource = { name: string; source: string };

export type ImageProperty = BaseProp<string> & {
  type: "image";
  predefined?: ImageSource[];
};

export type Choice<T extends string> = { label?: string; value: T };

export type ChoiceProperty<T extends string = string> = BaseProp<T> & {
  type: "choice";
  choices: Choice<T>[];
};

export type RenderConfigurationProperty =
  | NumericProperty
  | NumericRangeProperty
  | BooleanProperty
  | StringProperty
  | ImageProperty
  | ChoiceProperty;

export type RenderConfiguration = {
  [key: string]: RenderConfigurationProperty;
};

export type PropertyInfer<T> = T extends NumericProperty
  ? number
  : T extends NumericRangeProperty
  ? [number, number]
  : T extends BooleanProperty
  ? boolean
  : T extends StringProperty | ImageProperty | ChoiceProperty
  ? string
  : never;

export type RuntimeRenderConfiguration<T extends RenderConfiguration> = {
  [K in keyof T]: PropertyInfer<T[K]>;
};

export function makeRenderConfig<T extends RenderConfiguration>(source: T): T {
  // Validate
  for (let [key, propConfig] of Object.entries(source)) {
    switch (propConfig.type) {
      case "number":
      case "number-range":
        if (propConfig.min != undefined && propConfig.max != undefined && propConfig.min > propConfig.max) {
          throw new Error(
            `For property ${key} minimum value ${propConfig.min} is greater than maximum value ${propConfig.max}`
          );
        } else if (
          propConfig.default != undefined &&
          propConfig.min != undefined &&
          propConfig.default < propConfig.min
        ) {
          throw new Error(
            `For property ${key} default value ${propConfig.default} is less than minimum value ${propConfig.min}`
          );
        } else if (
          propConfig.default != undefined &&
          propConfig.max != undefined &&
          propConfig.default > propConfig.max
        ) {
          throw new Error(
            `For property ${key} default value ${propConfig.default} is greater than maximum value ${propConfig.max}`
          );
        }
        break;
      default:
        break;
    }
  }

  return source;
}

export function getDefaultConfiguration<T extends RenderConfiguration>(
  source: T,
  initial?: Partial<RuntimeRenderConfiguration<T>>
): RuntimeRenderConfiguration<T> {
  let res: any = {};

  for (let [key, propConfig] of Object.entries(source)) {
    (res as any)[key] = initial?.[key] || defaultForPropType(propConfig);
  }

  return res as RuntimeRenderConfiguration<T>;
}

function defaultForPropType(prop: RenderConfigurationProperty): any {
  switch (prop.type) {
    case "boolean":
      return prop.default || false;
    case "number":
      return (
        prop.default ||
        (prop.min != undefined && prop.max != undefined
          ? prop.min + (prop.max - prop.min) / 2
          : prop.min || prop.max || 0)
      );
    case "number-range":
      return prop.default || [prop.min, prop.max];
    case "string":
      return prop.default || "";
    case "image":
      return prop.default || prop.predefined?.[0]?.source || "";
    case "choice":
      return prop.default || prop.choices?.[0] || undefined;
    default:
      return undefined;
  }
}
