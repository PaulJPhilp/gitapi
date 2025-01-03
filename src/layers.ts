import { DefaultCompletionsService } from "./services/completions"
import { providersService } from "./services/providers"

export const completionsService = new DefaultCompletionsService(providersService) 