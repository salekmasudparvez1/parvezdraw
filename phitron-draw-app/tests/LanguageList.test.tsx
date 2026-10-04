import { defaultLang, languages } from "@prof/core/i18n";
import { UI } from "@prof/core/tests/helpers/ui";
import {
  screen,
  fireEvent,
  waitFor,
  render,
} from "@prof/core/tests/test-utils";

import ExcalidrawApp from "../App";

const TEST_LANG_CODE = "fr-FR";

describe("Test LanguageList", () => {
  it("rerenders UI on language change", async () => {
    expect(languages.some((lang) => lang.code === TEST_LANG_CODE)).toBe(true);

    await render(<ExcalidrawApp />);

    
    UI.clickTool("rectangle");
    
    expect(screen.queryByTitle(/thin/i)).not.toBeNull();
    fireEvent.click(document.querySelector(".dropdown-menu-button")!);

    fireEvent.change(document.querySelector(".dropdown-select__language")!, {
      target: { value: TEST_LANG_CODE },
    });
    
    await waitFor(() => expect(screen.queryByTitle(/thin/i)).toBeNull());
    
    fireEvent.change(document.querySelector(".dropdown-select__language")!, {
      target: { value: defaultLang.code },
    });
    
    await waitFor(() => expect(screen.queryByTitle(/thin/i)).not.toBeNull());
  });
});
