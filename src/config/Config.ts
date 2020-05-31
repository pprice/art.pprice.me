type BaseProp<T> = {
  displayName?: string;
  default?: T;
};

type NumericProperty = BaseProp<number> & {
  type: "number";
  min?: number;
  max?: number;
};

type NumericRangeProperty = BaseProp<[number, number]> & {
  type: "number-range";
  min: number;
  max: number;
};

type BooleanProperty = BaseProp<boolean> & {
  type: "boolean";
};

type StringProperty = BaseProp<string> & {
  type: "string";
};

type RenderConfigurationProperty = NumericProperty | NumericRangeProperty | BooleanProperty | StringProperty;

export type RenderConfiguration = {
  [key: string]: RenderConfigurationProperty;
};

type PropertyInfer<T> = T extends NumericProperty
  ? number
  : T extends NumericRangeProperty
  ? [number, number]
  : T extends BooleanProperty
  ? boolean
  : T extends StringProperty
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
      return prop.default || (prop.min != undefined && prop.max != undefined)
        ? (prop.max - prop.min) / 2
        : prop.min || prop.max || 0;
    case "number-range":
      return prop.default || [prop.min, prop.max];
    case "string":
      return prop.default || "";
    default:
      return undefined;
  }
}
