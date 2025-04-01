import UIKit
import Social
import UniformTypeIdentifiers

class ShareViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        // Get the URL from the extension context
        if let extensionContext = extensionContext,
           let extensionItems = extensionContext.inputItems as? [NSExtensionItem],
           let item = extensionItems.first,
           let attachments = item.attachments {
            
            for attachment in attachments {
                if attachment.hasItemConformingToTypeIdentifier(UTType.url.identifier) {
                    attachment.loadItem(forTypeIdentifier: UTType.url.identifier, options: nil) { (url, error) in
                        if let url = url as? URL {
                            // Open the main app with the URL
                            let appURL = URL(string: "chefing://share?url=\(url.absoluteString)")!
                            self.openURL(appURL)
                        }
                    }
                }
            }
        }
    }
    
    private func openURL(_ url: URL) {
        var responder: UIResponder? = self
        while responder != nil {
            if let application = responder as? UIApplication {
                application.perform(Selector(("openURL:")), with: url)
                break
            }
            responder = responder?.next
        }
    }
} 