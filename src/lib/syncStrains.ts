// src/lib/syncStrains.ts

interface ImageFormats {
    small: {
        url: string;
    };
    thumbnail: {
        url: string;
    };
}

interface ImageAttributes {
    alternative_text: string;
    width: number;
    height: number;
    mime: string;
    url: string;
    formats: ImageFormats;
}

interface ImageData {
    data: {
        id: number;
        attributes: ImageAttributes;
    };
}

interface Product {
    id: number;
    url: string;
    producer: string | null;
    name: string;
    thc: number;
    cbd: number;
    genetic: string;
    irradiated: boolean;
    origin: string;
    created_at: string;
    updated_at: string;
    published_at: string;
    created_by_id: number;
    updated_by_id: number;
    locale: string;
    description: string | null;
    strain_name: string;
    producer_name: string;
    ratings_score: number;
    ratings_count: number;
    min_price: number;
    max_price: number;
    availibility: number;
    image: ImageData | null;
}

interface Pagination {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
}

interface ApiResponse {
    message: {
        data: Product[];
        meta: {
            pagination: Pagination;
        };
    };
    error: boolean;
}

interface Vendor {
    id: string;
    attributes: {
        price: number;
        availibility: number;
        url: string | null;
        vendor: {
            data: {
                id: string;
                attributes: {
                    name: string;
                    website: string;
                    cannaleo_partner: string | null;
                };
            };
        };
    };
}

interface VendorApiResponse {
    message: {
        data: {
            priceFlowers: {
                data: Vendor[];
            };
            lastPriceUpdate: string;
        };
    };
    error: boolean;
}

export async function fetchStrains(updateMessage: (message: string) => void): Promise<void> {
    let allStrains: Product[] = [];
    let page = 1;
    const pageSize = 30; // The pageSize should match the one used by the API
    let hasMore = true;

    updateMessage('Syncing Cannabis Strains...');

    try {
        await new Promise(r => setTimeout(r, 2000));
        // Fetch the first page to get pagination info
        const initialResponse = await fetch(`https://flowzz.com/api/products?pagination[page]=${page}&pagination[pageSize]=${pageSize}`);
        const initialData: ApiResponse = await initialResponse.json();

        if (initialData.error) {
            throw new Error('API error');
        }

        // If the initial request is successful, add the strains from the first page
        if (initialData.message && initialData.message.data && initialData.message.data.length > 0) {
            allStrains = [...initialData.message.data];
            const pagination = initialData.message.meta.pagination;

            // Calculate the total number of pages
            const totalPages = pagination.pageCount;

            // Create an array of promises for the remaining pages
            const fetchPromises = [];

            for (let i = 2; i <= totalPages; i++) {
                fetchPromises.push(fetch(`https://flowzz.com/api/products?pagination[page]=${i}&pagination[pageSize]=${pageSize}`).then(res => res.json()));
            }

            // Wait for all promises to resolve
            const results = await Promise.all(fetchPromises);

            // Process each result and merge the data
            results.forEach((data: ApiResponse) => {
                if (data.message && data.message.data && data.message.data.length > 0) {
                    allStrains = [...allStrains, ...data.message.data];
                }
            });

            hasMore = false;
        } else {
            hasMore = false;
        }

        // Save the strains to local storage
        localStorage.setItem('cannabisStrains', JSON.stringify(allStrains));
        updateMessage(`${allStrains.length} Cannabis Strains available`);

    } catch (error) {
        console.error('Error fetching cannabis strains:', error);
        updateMessage('Failed to retrieve cannabis strains.');
    }
}


export async function fetchVendorsForStrain(strainId: number): Promise<VendorApiResponse | null> {
    try {
        const response = await fetch(`https://flowzz.com/api/vendor?t=2&id=${strainId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: VendorApiResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}