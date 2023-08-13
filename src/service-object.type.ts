import { Service } from "./service"

export type ServiceObject<K, AbstractType, ActualType extends AbstractType> = {
  key : K,
  value : Service<AbstractType, ActualType>
}